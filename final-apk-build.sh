#!/bin/bash

echo "🚀 Final RedVelvet APK Build - New Webapp UI"
echo "============================================"

cd android

# Clean any existing processes
./gradlew --stop >/dev/null 2>&1
pkill -f gradle >/dev/null 2>&1

# Remove old build artifacts
rm -rf app/build/outputs/apk/debug/
rm -rf .gradle/

echo "📱 Building with new UI features:"
echo "   ✓ Fixed top header with branding"
echo "   ✓ Diamond counter in header"
echo "   ✓ Fixed bottom navigation"
echo "   ✓ Consistent webapp-style layout"
echo ""

# Build APK
echo "🔨 Starting APK build..."
./gradlew assembleDebug --no-daemon --stacktrace --info

# Check result
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo ""
    echo "✅ SUCCESS! APK built successfully"
    echo "📦 Size: $APK_SIZE"
    echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🎨 NEW UI FEATURES INCLUDED:"
    echo "   • Fixed header layout (never scrolls away)"
    echo "   • Real-time diamond counter"
    echo "   • Professional bottom navigation"
    echo "   • Consistent 4-screen layout"
    echo "   • Matches webapp design"
    echo ""
    echo "🚀 Ready for testing on Android device!"
else
    echo ""
    echo "❌ Build failed or incomplete"
    echo "Check logs above for details"
fi