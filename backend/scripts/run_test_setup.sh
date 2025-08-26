#!/bin/bash

# ================================================
# Test Subscription Setup Script
# Give 3 random users a 1-week premium subscription
# ================================================

echo "🎉 MealLens AI - Test Subscription Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "database.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: backend/"
    exit 1
fi

# Check if Python script exists
if [ ! -f "scripts/setup_test_subscriptions.py" ]; then
    echo "❌ Error: setup_test_subscriptions.py not found"
    exit 1
fi

# Make the Python script executable
chmod +x scripts/setup_test_subscriptions.py

echo "🔄 Setting up test subscriptions for 3 random users..."
echo ""

# Run the Python script
python3 scripts/setup_test_subscriptions.py

echo ""
echo "✅ Test subscription setup completed!"
echo ""
echo "💡 What this does:"
echo "   - Selects 3 random users without active subscriptions"
echo "   - Gives them a 1-week premium subscription"
echo "   - Creates corresponding payment records"
echo "   - These users can now test all premium features"
echo ""
echo "🧹 To clean up test subscriptions later, run:"
echo "   python3 scripts/setup_test_subscriptions.py --cleanup"
echo "" 