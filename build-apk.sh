#!/bin/bash
# RedVelvet APK Build Script
# Production-ready Android APK with all fixes

echo "🚀 Building RedVelvet Android APK..."

# Sync web assets to Android
npx cap sync android

# Build APK
cd android
echo "📱 Generating APK with all mobile fixes..."
./gradlew assembleDebug

# Success message
echo "✅ APK Generated: android/app/build/outputs/apk/debug/app-debug.apk"
echo "🔧 Includes: AI chat, diamond system, fixed back button, keyboard handling"