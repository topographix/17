#!/bin/bash

# Build Android APK with new webapp-style UI layout
echo "Building RedVelvet Android APK with webapp-style UI..."

# Clean and build
cd android
./gradlew clean assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🎨 NEW UI FEATURES:"
    echo "• Fixed top header bar with RedVelvet branding"
    echo "• Diamond counter in header"
    echo "• Premium button in header"
    echo "• Fixed bottom navigation with 4 tabs"
    echo "• Consistent layout across all screens"
    echo "• Matches webapp design language"
    echo ""
    echo "🚀 Ready for testing on Android device!"
else
    echo "❌ Build failed. Check logs above."
fi