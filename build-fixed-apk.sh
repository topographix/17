#!/bin/bash

# Build Fixed APK - testServerConnection() method added
echo "🚀 Building Fixed RedVelvet APK"
echo "=============================="
echo ""
echo "🔧 FIX APPLIED: Added missing testServerConnection() method"
echo "📱 Device diamond system fully integrated"
echo "🌐 Server connection: https://red-velvet-connection.replit.app"
echo ""

# Navigate to android directory
cd android

# Clean previous build
echo "🧹 Cleaning previous build..."
./gradlew clean

# Build APK
echo "🏗️ Building APK..."
./gradlew assembleDebug

# Check result
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ SUCCESS! APK built successfully!"
    echo "================================="
    echo "📍 APK Location: android/$APK_PATH"
    echo "📊 APK Size: $(du -h $APK_PATH | cut -f1)"
    echo ""
    echo "🎯 FEATURES INCLUDED:"
    echo "   ✅ Missing testServerConnection() method added"
    echo "   ✅ Device fingerprinting system"
    echo "   ✅ Server connection testing"
    echo "   ✅ Diamond counter synchronization"
    echo "   ✅ Real-time chat with AI responses"
    echo "   ✅ Anti-abuse device tracking"
    echo ""
    echo "🔧 TESTING INSTRUCTIONS:"
    echo "   1. Install: adb install android/$APK_PATH"
    echo "   2. Launch app and verify home screen loads"
    echo "   3. Check diamond counter shows 25 diamonds"
    echo "   4. Test chat functionality"
    echo "   5. Verify server connection works"
    echo ""
    echo "✅ APK is ready for distribution!"
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Check the logs above for errors."
fi

cd ..
echo ""
echo "🎉 Fixed APK build complete!"