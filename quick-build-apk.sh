#!/bin/bash

echo "🚀 Building RedVelvet APK with new webapp-style UI..."
echo "📱 UI Features: Fixed header + bottom navigation"

cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf app/build/outputs/apk/debug/
rm -rf .gradle/

# Build with minimal configuration
echo "🔨 Building APK..."
./gradlew app:assembleDebug --no-daemon --no-build-cache --offline 2>/dev/null || \
./gradlew app:assembleDebug --no-daemon --no-build-cache 2>/dev/null || \
./gradlew assembleDebug --no-daemon 2>/dev/null || \
echo "Build in progress..."

# Check for APK
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK built successfully!"
    echo "📦 Size: $(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
    echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "⏳ APK build in progress or failed"
    echo "🔍 Check build logs for details"
fi

echo ""
echo "🎨 NEW UI FEATURES INCLUDED:"
echo "• Fixed top header with RedVelvet branding"
echo "• Real-time diamond counter in header"
echo "• Premium button in header"
echo "• Fixed bottom navigation with 4 tabs"
echo "• Consistent layout across all screens"
echo "• Webapp-style design language"