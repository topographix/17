#!/bin/bash

# Complete RedVelvet Android APK Build
echo "Starting complete Android APK build for RedVelvet..."

export JAVA_HOME=/nix/store/2vwkssqpzykk37r996cafq7x63imf4sp-openjdk-21+35
export PATH=$JAVA_HOME/bin:$PATH
export GRADLE_OPTS="-Xmx3072m -Dfile.encoding=UTF-8"

cd android

# Clean any existing builds
rm -rf app/build/
rm -rf .gradle/daemon/

# Build the APK with all required settings
echo "Building APK with optimized settings..."
./gradlew clean assembleDebug --no-daemon --parallel --max-workers=4 --stacktrace

# Check for successful build
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "SUCCESS: RedVelvet Android APK created successfully!"
    echo "Location: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    file app/build/outputs/apk/debug/app-debug.apk
    echo "The RedVelvet Android app is ready for installation and testing."
else
    echo "Checking for APK in alternate locations..."
    find . -name "*.apk" -type f -exec ls -lh {} \;
    echo "Build may still be in progress or encountered issues."
fi

echo "Build process completed."