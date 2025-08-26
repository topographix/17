#!/bin/bash

echo "🐛 BUILDING WEBVIEW DEBUG APK"
echo "=============================="

# Clean build
echo "🧹 Cleaning..."
cd android
./gradlew clean

echo "🔍 Debug Features Added:"
echo "- WebView error detection and logging"
echo "- Automatic fallback to TextView on WebView failure"
echo "- Simple HTML test instead of complex CSS"
echo "- Enhanced error reporting"

echo "🔨 Building debug APK..."
./gradlew assembleDebug --info

if [ $? -eq 0 ]; then
    echo "✅ WEBVIEW DEBUG APK BUILD SUCCESS!"
    echo "📱 APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    
    echo ""
    echo "🔬 Test Results Expected:"
    echo "- If WebView works: Simple RedVelvet page with 'WebView Test - Progressive Loading'"
    echo "- If WebView fails: TextView showing 'WebView Failed - Using TextView Mode'"
    echo "- Check logs to see specific WebView error codes"
else
    echo "❌ BUILD FAILED"
    exit 1
fi