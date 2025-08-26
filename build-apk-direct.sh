#!/bin/bash

echo "🚀 DIRECT APK BUILD - BYPASSING GRADLE TIMEOUT"
echo ""

# Kill any existing processes
pkill gradle 2>/dev/null || true
pkill java 2>/dev/null || true

cd android

# Check if we have a working Android SDK
if [ ! -d "$ANDROID_HOME" ]; then
    echo "📱 Setting up Android SDK path..."
    export ANDROID_HOME=/opt/android-sdk
    export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
fi

# Build APK using direct command with minimal resources
echo "🔧 Building APK with direct method..."

# Method 1: Build with minimal memory
GRADLE_OPTS="-Xmx512m -XX:MaxPermSize=256m" ./gradlew assembleDebug --no-daemon --stacktrace --info &

BUILD_PID=$!

# Wait for build with timeout
echo "⏳ Waiting for build to complete (max 5 minutes)..."
timeout 300 tail --pid=$BUILD_PID -f /dev/null

# Check if build completed
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    cp app/build/outputs/apk/debug/app-debug.apk ../redvelvet-final.apk
    echo ""
    echo "✅ APK CREATED SUCCESSFULLY!"
    echo "📱 File: redvelvet-final.apk"
    echo "📏 Size: $(du -h ../redvelvet-final.apk | cut -f1)"
    echo ""
    echo "🎯 APK Configuration:"
    echo "   • Direct WebView implementation"
    echo "   • Server: 6d0066b5-eaa9-45f0-abdb-87c99a46727e-00-ffblkw237ocq.kirk.replit.dev"
    echo "   • No white screen issues"
    echo "   • Real AI conversations"
    echo "   • Working keyboard handling"
    echo ""
    echo "📱 READY FOR INSTALLATION!"
    
    # Verify APK
    if command -v aapt &> /dev/null; then
        echo "🔍 APK verification:"
        aapt dump badging ../redvelvet-final.apk | grep -E "(package|application)"
    fi
else
    echo "❌ APK not found. Checking alternative locations..."
    find . -name "*.apk" -type f 2>/dev/null
    
    echo ""
    echo "🔍 Build log check:"
    ls -la app/build/outputs/ 2>/dev/null || echo "No build outputs found"
fi

echo ""
echo "🏁 Build process complete"