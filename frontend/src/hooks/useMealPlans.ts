import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface MealPlan {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  breakfast_ingredients?: string[];
  lunch_ingredients?: string[];
  dinner_ingredients?: string[];
  snack_ingredients?: string[];
}

export interface SavedMealPlan {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  mealPlan: MealPlan[];
  createdAt: string;
  updatedAt: string;
}

export const useMealPlans = () => {
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SavedMealPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all meal plans from backend API on mount
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const result = await api.getMealPlans();
        
        console.log('[DEBUG] Received meal plans response:', result);
        
        if (result.status === 'success' && result.meal_plans) {
          const plans = result.meal_plans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            startDate: plan.start_date,
            endDate: plan.end_date,
            mealPlan: plan.meal_plan,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at,
          }));
          console.log('[DEBUG] Processed meal plans:', plans);
          setSavedPlans(plans);
          if (plans.length > 0) setCurrentPlan(plans[0]);
        } else {
          console.warn('No meal plans found or API returned error:', result.message);
          setSavedPlans([]);
          setCurrentPlan(null);
        }
      } catch (error) {
        console.warn('Error fetching meal plans (this is normal for new users):', error);
        // Don't throw error, just set empty state
        setSavedPlans([]);
        setCurrentPlan(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small delay to prevent race conditions
    const timer = setTimeout(fetchPlans, 100);
    return () => clearTimeout(timer);
  }, []);

  const generateWeekDates = (startDate: Date): { startDate: string; endDate: string; name: string } => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      name: `${formatDate(startDate)} - ${formatDate(endDate)}`
    };
  };

  const saveMealPlan = async (mealPlan: MealPlan[], startDate?: Date) => {
    setLoading(true);
    try {
      // Validate the meal plan data
      if (!mealPlan || !Array.isArray(mealPlan) || mealPlan.length === 0) {
        throw new Error('Invalid meal plan data: meal plan is empty or not an array');
      }

      // Validate each meal plan entry
      for (let i = 0; i < mealPlan.length; i++) {
        const day = mealPlan[i];
        if (!day.day || !day.breakfast || !day.lunch || !day.dinner || !day.snack) {
          throw new Error(`Invalid meal plan data at day ${i + 1}: missing required fields`);
        }
      }

      const now = new Date();
      const weekDates = startDate ? generateWeekDates(startDate) : generateWeekDates(now);

      const planData = {
        name: weekDates.name,
        start_date: weekDates.startDate,
        end_date: weekDates.endDate,
        meal_plan: mealPlan,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      console.log('[DEBUG] Sending meal plan data:', planData);
      console.log('[DEBUG] Meal plan structure validation passed');

      const result = await api.saveMealPlan(planData);
      console.log('[DEBUG] API response received:', result);

      if (result && result.status === 'success') {
        console.log('[DEBUG] Meal plan saved successfully:', result);
        
        // Refresh the plans list
        try {
          const refreshResult = await api.getMealPlans();
          console.log('[DEBUG] Refresh result:', refreshResult);
          
          if (refreshResult.status === 'success' && refreshResult.meal_plans) {
            const plans = refreshResult.meal_plans.map((plan: any) => ({
              id: plan.id,
              name: plan.name,
              startDate: plan.start_date,
              endDate: plan.end_date,
              mealPlan: plan.meal_plan,
              createdAt: plan.created_at,
              updatedAt: plan.updated_at,
            }));
            setSavedPlans(plans);
            if (plans.length > 0) setCurrentPlan(plans[0]);
            console.log('[DEBUG] Plans list updated successfully');
          }
        } catch (refreshError) {
          console.warn('[DEBUG] Failed to refresh plans list, but meal plan was saved:', refreshError);
          // Don't throw this error since the main save was successful
        }
      } else {
        const errorMessage = result?.message || result?.error || 'Unknown error from backend';
        console.error('[DEBUG] Backend returned error:', errorMessage);
        throw new Error(`Failed to save meal plan: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        mealPlan: mealPlan,
        startDate: startDate
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMealPlan = async (id: string, mealPlan: MealPlan[]) => {
    setLoading(true);
    try {
      const now = new Date();
      const planData = {
          meal_plan: mealPlan, 
          updated_at: now.toISOString() 
      };

      console.log('[DEBUG] Updating meal plan:', id, planData);

      const result = await api.updateMealPlan(id, planData);
      
      if (result.status === 'success') {
        console.log('[DEBUG] Meal plan updated successfully:', result);
        
        // Update the current plan if it's the one being updated
        if (currentPlan && currentPlan.id === id) {
          setCurrentPlan({
            ...currentPlan,
          mealPlan: mealPlan,
            updatedAt: now.toISOString()
          });
        }
        
        // Update the plans list
        const refreshResult = await api.getMealPlans();
        if (refreshResult.status === 'success' && refreshResult.meal_plans) {
          const plans = refreshResult.meal_plans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            startDate: plan.start_date,
            endDate: plan.end_date,
            mealPlan: plan.meal_plan,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at,
          }));
          setSavedPlans(plans);
        }
      } else {
        throw new Error(result.message || 'Failed to update meal plan');
      }
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMealPlan = async (id: string) => {
    setLoading(true);
    try {
      console.log('[DEBUG] Deleting meal plan:', id);

      const result = await api.deleteMealPlan(id);
      
      if (result.status === 'success') {
        console.log('[DEBUG] Meal plan deleted successfully:', result);
        
        // Remove from current plan if it's the one being deleted
        if (currentPlan && currentPlan.id === id) {
          setCurrentPlan(null);
        }
        
        // Update the plans list
        const refreshResult = await api.getMealPlans();
        if (refreshResult.status === 'success' && refreshResult.meal_plans) {
          const plans = refreshResult.meal_plans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            startDate: plan.start_date,
            endDate: plan.end_date,
            mealPlan: plan.meal_plan,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at,
          }));
          setSavedPlans(plans);
        }
      } else {
        throw new Error(result.message || 'Failed to delete meal plan');
      }
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectMealPlan = (id: string) => {
    const plan = savedPlans.find(p => p.id === id);
    if (plan) {
      setCurrentPlan(plan);
    }
  };

  const duplicateMealPlan = async (id: string, newStartDate: Date) => {
    setLoading(true);
    try {
    const originalPlan = savedPlans.find(p => p.id === id);
      if (!originalPlan) {
        throw new Error('Original plan not found');
      }
    
    const weekDates = generateWeekDates(newStartDate);
    const planData = {
      name: weekDates.name,
      start_date: weekDates.startDate,
      end_date: weekDates.endDate,
      meal_plan: originalPlan.mealPlan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[DEBUG] Duplicating meal plan:', planData);

      const result = await api.saveMealPlan(planData);

      if (result.status === 'success') {
        console.log('[DEBUG] Meal plan duplicated successfully:', result);
        
        // Refresh the plans list
        const refreshResult = await api.getMealPlans();
        if (refreshResult.status === 'success' && refreshResult.meal_plans) {
          const plans = refreshResult.meal_plans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            startDate: plan.start_date,
            endDate: plan.end_date,
            mealPlan: plan.meal_plan,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at,
          }));
          setSavedPlans(plans);
          if (plans.length > 0) setCurrentPlan(plans[0]);
        }
    } else {
      throw new Error(result.message || 'Failed to duplicate meal plan');
      }
    } catch (error) {
      console.error('Error duplicating meal plan:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearAllPlans = async () => {
    setLoading(true);
    try {
      console.log('[DEBUG] Clearing all meal plans');

      // Since there's no bulk delete method, delete plans one by one
      const deletePromises = savedPlans.map(plan => api.deleteMealPlan(plan.id));
      await Promise.all(deletePromises);
      
      console.log('[DEBUG] All meal plans cleared successfully');
      setSavedPlans([]);
      setCurrentPlan(null);
    } catch (error) {
      console.error('Error clearing meal plans:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshMealPlans = async () => {
    setLoading(true);
    try {
      const result = await api.getMealPlans();
      
      if (result.status === 'success' && result.meal_plans) {
        const plans = result.meal_plans.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          startDate: plan.start_date,
          endDate: plan.end_date,
          mealPlan: plan.meal_plan,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
        }));
        setSavedPlans(plans);
        if (plans.length > 0) setCurrentPlan(plans[0]);
      } else {
        console.error('Error refreshing meal plans:', result.message);
        setSavedPlans([]);
        setCurrentPlan(null);
      }
    } catch (error) {
      console.error('Error refreshing meal plans:', error);
      setSavedPlans([]);
      setCurrentPlan(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    savedPlans,
    currentPlan,
    loading,
    saveMealPlan,
    updateMealPlan,
    deleteMealPlan,
    selectMealPlan,
    duplicateMealPlan,
    clearAllPlans,
    refreshMealPlans,
    generateWeekDates
  };
}; 