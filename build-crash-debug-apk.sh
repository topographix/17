#!/bin/bash

echo "🐛 BUILDING CRASH DEBUG APK"
echo "============================"

# Clean any duplicates
echo "🧹 Cleaning duplicate files..."
rm -f android/app/src/main/java/com/redvelvet/aicompanion/MainActivity-simple.java

# Verify single MainActivity file
MAIN_FILES=$(find android -name "*MainActivity*.java" | grep -v test)
echo "MainActivity files found: $MAIN_FILES"

if [ $(echo "$MAIN_FILES" | wc -l) -gt 1 ]; then
    echo "❌ Multiple MainActivity files found - removing duplicates"
    find android -name "*MainActivity-simple*" -delete
fi

# Check critical Android configurations
echo "🔍 Checking Android configurations..."
echo "AndroidManifest.xml permissions:"
grep -E "(INTERNET|NETWORK)" android/app/src/main/AndroidManifest.xml || echo "No network permissions found"

echo "Network security config:"
ls -la android/app/src/main/res/xml/network_security_config.xml || echo "No network security config"

# Build with verbose logging
echo "📦 Building APK with crash debugging..."
cd android
./gradlew assembleDebug --info --stacktrace

if [ $? -eq 0 ]; then
    echo "✅ CRASH DEBUG APK BUILD SUCCESSFUL!"
    echo "📍 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -la app/build/outputs/apk/debug/
else
    echo "❌ CRASH DEBUG APK BUILD FAILED!"
    exit 1
fi