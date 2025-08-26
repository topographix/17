#!/bin/bash

echo "🚀 BUILDING PROGRESSIVE WEBVIEW APK"
echo "==================================="

# Clean build
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

echo "📋 Progressive WebView Features:"
echo "- WebView with minimal settings (JS disabled)"
echo "- RedVelvet companion grid interface"
echo "- TextView fallback if WebView fails"
echo "- Gradient background and proper styling"
echo "- Ready for server connection upgrade"

echo "🔨 Building progressive APK..."
./gradlew assembleDebug --stacktrace

if [ $? -eq 0 ]; then
    echo "✅ PROGRESSIVE WEBVIEW APK BUILD SUCCESS!"
    echo "📱 APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    
    echo ""
    echo "📱 Expected Interface:"
    echo "- RedVelvet gradient background"
    echo "- Header: 'RedVelvet Mobile - AI Companion Platform'"
    echo "- Status: 'WebView Active - Ready for Server Connection'"
    echo "- 4 companion cards in 2x2 grid layout"
    echo "- Sophia, Emma, Isabella, James with taglines"
    
    echo ""
    echo "🔄 Next Steps:"
    echo "1. Test this WebView version"
    echo "2. If stable, add JavaScript and server connectivity"
    echo "3. Implement full companion functionality"
else
    echo "❌ BUILD FAILED"
    exit 1
fi