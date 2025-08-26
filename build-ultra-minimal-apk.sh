#!/bin/bash

echo "🔥 BUILDING ULTRA-MINIMAL APK"
echo "=============================="

# Clean everything
echo "🧹 Deep cleaning..."
rm -f android/app/src/main/java/com/redvelvet/aicompanion/MainActivity-*.java
find android -name "*.class" -delete 2>/dev/null || true

# Verify single MainActivity
echo "📋 Verifying MainActivity..."
ls -la android/app/src/main/java/com/redvelvet/aicompanion/MainActivity.java

# Show Java code summary
echo "📝 MainActivity summary:"
grep -n "class MainActivity\|WebView\|TextView" android/app/src/main/java/com/redvelvet/aicompanion/MainActivity.java

echo "🔨 Building ultra-minimal APK..."
cd android
./gradlew clean assembleDebug --info

if [ $? -eq 0 ]; then
    echo "✅ ULTRA-MINIMAL APK BUILD SUCCESS!"
    echo "📱 APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
else
    echo "❌ BUILD FAILED"
    exit 1
fi