#!/bin/bash

# RedVelvet Android APK Final Build Script
echo "=== RedVelvet Android APK Build ==="

# Environment setup
export JAVA_HOME=/nix/store/2vwkssqpzykk37r996cafq7x63imf4sp-openjdk-21+35
export PATH=$JAVA_HOME/bin:$PATH
export GRADLE_OPTS="-Xmx4096m -Dfile.encoding=UTF-8"

cd android

echo "Cleaning previous builds..."
rm -rf app/build/
rm -rf .gradle/

echo "Starting APK build..."
./gradlew assembleDebug --no-daemon --offline --parallel || \
./gradlew assembleDebug --no-daemon --parallel

echo "Build completed. Checking for APK..."
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK successfully created!"
    echo "📱 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    echo "🎉 RedVelvet Android app is ready for installation!"
else
    echo "⚠️ Checking alternate APK locations..."
    find app/build -name "*.apk" -type f 2>/dev/null
fi