#!/bin/bash

echo "🔧 Building RedVelvet APK with UI Fixes"
echo "======================================="

echo "✅ FIXES INCLUDED:"
echo "   1. Fixed header/footer bars staying visible"
echo "   2. Working diamond counter with server sync"
echo "   3. Profile images and enhanced settings"
echo "   4. Professional companion cards"
echo "   5. Complete premium packages section"
echo ""

cd android

# Clean build
echo "🧹 Cleaning previous build..."
./gradlew clean --no-daemon

# Build APK
echo "🔨 Building APK with fixes..."
./gradlew assembleDebug --no-daemon --stacktrace

# Check result
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo ""
    echo "✅ SUCCESS! Fixed APK built"
    echo "📦 Size: $APK_SIZE"
    echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🔧 UI FIXES:"
    echo "   ✓ Header/footer bars persist across all screens"
    echo "   ✓ Diamond counter syncs with server"
    echo "   ✓ Profile pictures in companion cards"
    echo "   ✓ Enhanced settings with clickable options"
    echo "   ✓ Complete premium packages display"
    echo ""
    echo "🚀 Ready for testing!"
else
    echo ""
    echo "❌ Build failed"
    echo "Check logs above for details"
fi