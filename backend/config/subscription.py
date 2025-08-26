# Subscription System Configuration
import os
from datetime import datetime, timedelta
from typing import Dict, Any

# Free tier configuration
FREE_TRIAL_DAYS = int(os.getenv('FREE_TRIAL_DAYS', '7'))  # Updated from 3 to 7 days
FREE_RESET_PERIOD = os.getenv('FREE_RESET_PERIOD', 'monthly')

# Paid plan durations (in days)
PAID_PLANS = {
    'weekly': 7,
    'two_weeks': 14,
    'monthly': 30
}

# Feature limits for free tier
FREE_FEATURE_LIMITS = {
    'food_detection': 3,  # per week
    'meal_planning': 0,   # not available in free tier
    'recipe_generation': 5  # per week
}

# Feature access for paid tiers
PAID_FEATURE_ACCESS = {
    'food_detection': True,
    'meal_planning': True,
    'recipe_generation': True
}

def get_free_trial_end_date(user_created_at: str) -> datetime:
    """Calculate free trial end date for a user."""
    created_date = datetime.fromisoformat(user_created_at.replace('Z', '+00:00'))
    return created_date + timedelta(days=FREE_TRIAL_DAYS)

def get_free_tier_reset_date(last_reset_date: str = None) -> datetime:
    """Calculate next free tier reset date."""
    if last_reset_date:
        base_date = datetime.fromisoformat(last_reset_date.replace('Z', '+00:00'))
    else:
        base_date = datetime.utcnow()
    
    if FREE_RESET_PERIOD == 'monthly':
        # Reset on the same day of next month
        if base_date.month == 12:
            return base_date.replace(year=base_date.year + 1, month=1)
        else:
            return base_date.replace(month=base_date.month + 1)
    elif FREE_RESET_PERIOD == 'weekly':
        return base_date + timedelta(weeks=1)
    else:  # yearly
        return base_date.replace(year=base_date.year + 1)

def get_paid_plan_duration(plan_name: str) -> int:
    """Get duration in days for a paid plan."""
    return PAID_PLANS.get(plan_name, 30)

def is_feature_allowed_for_free_tier(feature_name: str) -> bool:
    """Check if a feature is allowed for free tier users."""
    return feature_name in FREE_FEATURE_LIMITS

def is_feature_allowed_for_paid_tier(feature_name: str) -> bool:
    """Check if a feature is allowed for paid tier users."""
    return PAID_FEATURE_ACCESS.get(feature_name, False)

def format_currency(amount: float, currency: str = 'USD') -> str:
    """Format currency amount."""
    if currency == 'USD':
        return f"${amount:.2f}"
    elif currency == 'NGN':
        return f"₦{amount:,.0f}"
    else:
        return f"{amount:.2f} {currency}"

def get_plan_display_name(plan_name: str) -> str:
    """Get display name for a plan."""
    display_names = {
        'free': 'Free Plan',
        'weekly': 'Weekly Plan',
        'two_weeks': 'Two-Week Plan',
        'monthly': 'Monthly Plan'
    }
    return display_names.get(plan_name, plan_name.title())

def get_plan_description(plan_name: str) -> str:
    """Get description for a plan."""
    descriptions = {
        'free': 'Basic features with limited usage',
        'weekly': '7 days of unlimited access',
        'two_weeks': '14 days of unlimited access',
        'monthly': '30 days of unlimited access'
    }
    return descriptions.get(plan_name, '') 