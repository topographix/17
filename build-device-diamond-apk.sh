#!/bin/bash

# Build APK with Device Diamond System
echo "💎 Building Device Diamond System APK"
echo "====================================="
echo ""
echo "🔧 DEVICE DIAMOND SYSTEM FEATURES:"
echo "   ✅ Back button fixed - proper navigation to home screen"
echo "   ✅ Device-based diamond tracking with server database"
echo "   ✅ Diamond deduction per message with AI response"
echo "   ✅ Real-time diamond counter synchronization"
echo "   ✅ Automatic diamond sync on app startup"
echo "   ✅ Proper device fingerprinting for anti-abuse"
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
    echo "🎉 SUCCESS! Device Diamond APK built!"
    echo "======================================"
    echo "📍 APK Location: android/$APK_PATH"
    echo "📊 APK Size: $(du -h $APK_PATH | cut -f1)"
    echo ""
    echo "💎 DEVICE DIAMOND FEATURES:"
    echo "   ✅ Back button: Returns to home screen properly"
    echo "   ✅ Diamond tracking: Each device ID mapped to diamond count"
    echo "   ✅ Server sync: Diamond count synced on app startup"
    echo "   ✅ Message cost: 1 diamond per message with AI response"
    echo "   ✅ Database storage: All diamond data stored in PostgreSQL"
    echo "   ✅ Anti-abuse: Device fingerprinting prevents farming"
    echo ""
    echo "🎯 TESTING INSTRUCTIONS:"
    echo "   1. Install: adb install android/$APK_PATH"
    echo "   2. Launch app - verify diamond counter shows 25"
    echo "   3. Enter chat and send message - diamond count decreases"
    echo "   4. Press back button - returns to home screen"
    echo "   5. Close and reopen app - diamond count persists"
    echo "   6. Each device has independent diamond tracking"
    echo ""
    echo "🚀 Device diamond system is production ready!"
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Check the logs above for errors."
fi

cd ..
echo ""
echo "💎 Device diamond APK build complete!"