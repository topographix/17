#!/bin/bash

echo "Building RedVelvet APK with new webapp-style UI..."
echo "Current URL: https://red-velvet-connection.replit.app"

cd android

# Quick build attempt
nohup ./gradlew assembleDebug --no-daemon --parallel > build.log 2>&1 &
BUILD_PID=$!

echo "Build started in background (PID: $BUILD_PID)"
echo "Build log: android/build.log"

# Wait a moment to see if build starts
sleep 10

if ps -p $BUILD_PID > /dev/null; then
    echo "✅ Build process running successfully"
    echo "📱 New UI features in this APK:"
    echo "   • Fixed top header with RedVelvet branding"
    echo "   • Diamond counter in header"
    echo "   • Premium button in header"
    echo "   • Fixed bottom navigation with 4 tabs"
    echo "   • Consistent layout across all screens"
    echo ""
    echo "⏳ Build will complete in a few minutes"
    echo "📁 APK will be saved to: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Build process failed to start"
fi

echo ""
echo "🚀 Ready for testing once build completes!"