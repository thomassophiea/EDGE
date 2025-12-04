#!/bin/bash

# 🚀 Quick Deploy Script for Railway
# Run this in your terminal: bash deploy.sh

echo "🚀 Deploying Edge Services Site to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed!"
    echo ""
fi

# Step 1: Login
echo "📝 Step 1: Login to Railway"
echo "   (This will open your browser)"
railway login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo "✅ Login successful!"
echo ""

# Step 2: Link project
echo "📝 Step 2: Link to Railway project"
echo "   (Create new project or select existing)"
railway link

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project."
    exit 1
fi

echo "✅ Project linked!"
echo ""

# Step 3: Deploy
echo "📝 Step 3: Deploying application..."
echo "   (This may take 2-3 minutes)"
railway up

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Check logs:"
    echo "   railway logs"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# Get deployment URL
echo "🌐 Getting your app URL..."
railway status

echo ""
echo "🎉 Done! Your app is live!"
echo ""
echo "📊 Next steps:"
echo "   1. Open your app URL (shown above)"
echo "   2. Login with Campus Controller credentials"
echo "   3. Go to Service Levels → Select a service"
echo "   4. Network Rewind will appear after 15 minutes"
echo ""
echo "🔍 View logs: railway logs"
echo "📈 Check status: railway status"
echo ""
