#!/bin/bash

echo "📱 BUILDING NATIVE TEXTVIEW APK (WEBVIEW-FREE)"
echo "=============================================="

echo "🎯 Strategy: Complete WebView Bypass"
echo "- WebView completely disabled"
echo "- Native TextView interface with companion list"
echo "- RedVelvet branding and styling"
echo "- Ready for next phase server connection"

cd android
./gradlew clean
./gradlew assembleDebug --info

if [ $? -eq 0 ]; then
    echo "✅ NATIVE TEXTVIEW APK BUILD SUCCESS!"
    echo "📱 APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    
    echo ""
    echo "📋 Expected Interface:"
    echo "- RedVelvet Mobile header"
    echo "- Available Companions list with emojis"
    echo "- Sophia, Emma, Isabella, James"
    echo "- Native Interface Mode status"
    echo "- 25 Diamonds Available"
    echo "- Ready for Server Connection"
    
    echo ""
    echo "🔄 Next Phase Plan:"
    echo "1. Confirm TextView interface works perfectly"
    echo "2. Add server API connection (without WebView)"
    echo "3. Implement companion data fetching"
    echo "4. Add chat functionality via server calls"
    echo "5. Full RedVelvet experience without WebView dependency"
else
    echo "❌ BUILD FAILED"
    exit 1
fi