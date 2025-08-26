#!/bin/bash

# RedVelvet Diagnostic APK Build Script
# This creates a simplified APK to debug crash issues

echo "🚀 Building RedVelvet Diagnostic APK..."

# Check for duplicate MainActivity files
echo "🔍 Checking for duplicate files..."
if [ -f "android/app/src/main/java/com/redvelvet/aicompanion/MainActivity-simple.java" ]; then
    echo "⚠️  Removing duplicate MainActivity-simple.java..."
    rm android/app/src/main/java/com/redvelvet/aicompanion/MainActivity-simple.java
fi

# Verify Android project structure
if [ ! -d "android" ]; then
    echo "❌ Android directory not found. Please ensure you're in the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build the diagnostic APK
echo "🔨 Building diagnostic APK..."
./gradlew assembleDebug

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Diagnostic APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🔍 This diagnostic version includes:"
    echo "   - Simple HTML interface with RedVelvet branding"
    echo "   - Minimal JavaScript (just a test button)"
    echo "   - Comprehensive error handling in Android methods"
    echo "   - Detailed logging for crash diagnosis"
    echo ""
    echo "🎯 Test this APK to identify if crashes are due to:"
    echo "   - Android WebView configuration issues"
    echo "   - Complex JavaScript with server calls"
    echo "   - Memory/resource constraints"
    echo "   - Network connectivity problems"
else
    echo "❌ APK build failed. Check the error messages above."
    exit 1
fi

cd ..
echo "🎉 Diagnostic APK ready for testing!"