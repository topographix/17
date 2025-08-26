#!/bin/bash

echo "🔥 RedVelvet GitHub Setup"
echo "========================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial RedVelvet app setup with Android build support"
    git branch -M main
else
    echo "Git repository already exists"
fi

echo ""
echo "Next steps:"
echo "1. Create repository at: https://github.com/new"
echo "2. Name it 'redvelvet-app' or your preferred name"
echo "3. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "4. Go to repository Actions tab to monitor APK build"
echo "5. Download APK from Actions artifacts when complete"
echo ""
echo "Your GitHub Actions workflow is configured and ready!"