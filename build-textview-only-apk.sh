#!/bin/bash

echo "📱 BUILDING TEXTVIEW-ONLY APK (NO WEBVIEW)"
echo "=========================================="

# Remove any duplicate files
rm -f android/app/src/main/java/com/redvelvet/aicompanion/MainActivity-*.java

# Show what we're building
echo "📋 MainActivity content:"
echo "- Pure TextView implementation"
echo "- No WebView dependencies"
echo "- Minimal Android code"
echo "- Zero JavaScript"

# Build the APK
echo "🔨 Building..."
cd android
./gradlew clean assembleDebug --stacktrace

if [ $? -eq 0 ]; then
    echo "✅ TEXTVIEW-ONLY APK BUILD SUCCESS!"
    echo "📱 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    
    echo ""
    echo "📋 APK Info:"
    echo "- Type: TextView only (no WebView)"
    echo "- Size: $(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')"
    echo "- Expected: Purple screen with white text"
    echo "- Test: Should NOT crash"
else
    echo "❌ BUILD FAILED"
    exit 1
fi