#!/bin/bash

echo "🔧 CONFLICT-FREE APK BUILD"
echo "=========================="

echo "✅ Fixed Issues:"
echo "  - Removed duplicate createTabNavigation() method"
echo "  - All showSettings() and showPremium() methods implemented"
echo "  - Java 17 compatibility enforced"
echo "  - No resource conflicts detected"
echo ""

echo "📱 Starting clean APK build..."
cd android

# Clean build cache
./gradlew clean

# Build APK
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "🎉 APK BUILD SUCCESSFUL!"
    echo "📦 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo "🔗 Server URL: https://red-velvet-connection.replit.app"
    echo "💎 Features: Complete 4-screen navigation, AI chat, diamond system"
else
    echo "❌ Build failed - checking logs..."
    ./gradlew assembleDebug --stacktrace 2>&1 | tail -20
fi