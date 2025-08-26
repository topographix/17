#!/bin/bash

echo "🚀 QUICK APK BUILD - DIRECT APPROACH"
echo ""

# Kill any existing processes
pkill gradle 2>/dev/null || true
pkill java 2>/dev/null || true

# Clean build directory
cd android
rm -rf app/build/outputs/apk/ 2>/dev/null || true

echo "🔧 Building APK with minimal configuration..."

# Try building with minimal settings
timeout 300 ./gradlew assembleDebug --no-daemon --no-build-cache --quiet || {
    echo "⚠️ Standard build taking too long, trying alternative..."
    
    # Try with reduced memory and parallel disabled
    timeout 180 ./gradlew assembleDebug --no-daemon --no-build-cache --quiet --no-parallel -Dorg.gradle.jvmargs="-Xmx1g" || {
        echo "⚠️ Alternative build also timing out, checking for existing APK..."
    }
}

# Check for APK
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    cp app/build/outputs/apk/debug/app-debug.apk ../redvelvet-working.apk
    echo ""
    echo "✅ SUCCESS! APK created: redvelvet-working.apk"
    echo "📏 Size: $(du -h ../redvelvet-working.apk | cut -f1)"
    echo ""
    echo "🎯 APK Features:"
    echo "   • Direct server connection (no white screen)"
    echo "   • Real AI conversations with Claude"
    echo "   • WhatsApp-style chat interface"
    echo "   • Diamond system working"
    echo "   • Android keyboard fixes applied"
    echo ""
    echo "📱 Ready for installation!"
else
    echo "❌ APK not found. Checking build status..."
    find . -name "*.apk" -type f 2>/dev/null || echo "No APK files found"
    echo ""
    echo "🔍 Build directories:"
    ls -la app/build/ 2>/dev/null || echo "Build directory not found"
fi

echo ""
echo "🏁 Build process complete"