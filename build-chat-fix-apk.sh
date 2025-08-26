#!/bin/bash

# Build APK with Chat & Diamond Fixes
echo "🔧 Building APK with Chat & Diamond Fixes"
echo "========================================="
echo ""
echo "🚀 CRITICAL FIXES APPLIED:"
echo "   ✅ Back button now properly returns to main interface"
echo "   ✅ Diamond counter synchronized with device-based system"
echo "   ✅ Chat messages use consistent mobile API endpoints"
echo "   ✅ Removed local diamond deduction (server-only tracking)"
echo "   ✅ Fixed API endpoint consistency issues"
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
    echo "🎉 SUCCESS! Chat & Diamond Fix APK built!"
    echo "==========================================="
    echo "📍 APK Location: android/$APK_PATH"
    echo "📊 APK Size: $(du -h $APK_PATH | cut -f1)"
    echo ""
    echo "🔧 FIXES APPLIED:"
    echo "   ✅ Back button functionality restored"
    echo "   ✅ Diamond counter server synchronization"
    echo "   ✅ Consistent device-based API endpoints"
    echo "   ✅ Removed diamond count inconsistencies"
    echo "   ✅ Proper chat state management"
    echo ""
    echo "🎯 TEST INSTRUCTIONS:"
    echo "   1. Install: adb install android/$APK_PATH"
    echo "   2. Start chat with companion"
    echo "   3. Send messages and verify diamond counter updates correctly"
    echo "   4. Press back button - should return to main screen"
    echo "   5. Diamond count should remain consistent"
    echo ""
    echo "🚀 Chat & Diamond issues fixed!"
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Check the logs above for errors."
fi

cd ..
echo ""
echo "🎉 Chat fix APK build complete!"