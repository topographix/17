#!/bin/bash

# RedVelvet Android APK Build Script
echo "Building RedVelvet Android APK..."

# Set Java environment
export JAVA_HOME=/nix/store/2vwkssqpzykk37r996cafq7x63imf4sp-openjdk-21+35
export PATH=$JAVA_HOME/bin:$PATH

# Navigate to android directory
cd android

# Build the debug APK
echo "Starting Gradle build..."
./gradlew assembleDebug --no-daemon --parallel --stacktrace

# Check if APK was created
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK built successfully!"
    echo "APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -la app/build/outputs/apk/debug/
else
    echo "❌ APK build failed or APK not found"
    echo "Build output directory contents:"
    find app/build -name "*.apk" 2>/dev/null || echo "No APK files found"
fi