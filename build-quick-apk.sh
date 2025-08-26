#!/bin/bash

echo "🚀 BUILDING APK - Quick Build Script"
echo "======================================"

# Remove any duplicate files
echo "🧹 Cleaning duplicate files..."
rm -f android/app/src/main/java/com/redvelvet/aicompanion/MainActivity-simple.java

# Build APK
echo "📦 Building APK..."
cd android
./gradlew assembleDebug --quiet --no-daemon

if [ $? -eq 0 ]; then
    echo "✅ APK BUILD SUCCESSFUL!"
    echo "📍 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -la app/build/outputs/apk/debug/
else
    echo "❌ APK BUILD FAILED!"
    exit 1
fi