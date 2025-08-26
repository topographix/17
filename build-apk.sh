#!/bin/bash

# RedVelvet APK Build Script
# Simple keyboard fix implementation

echo "🚀 Building RedVelvet APK with keyboard fix"
echo ""

# Build the web application
echo "🔧 Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Sync with Capacitor
echo "📱 Syncing with Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Sync failed"
    exit 1
fi

# Build APK
echo "🔧 Building APK..."
cd android
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ APK build failed"
    exit 1
fi

# Copy APK to root
cp app/build/outputs/apk/debug/app-debug.apk ../redvelvet.apk
cd ..

echo "✅ APK built successfully!"
echo "📍 File: redvelvet.apk"
echo ""
echo "🎯 Features:"
echo "   - Local APK with GUI stored in app (not server)"
echo "   - Dynamic API calls to current development server"
echo "   - Server URL: https://6d0066b5-eaa9-45f0-abdb-87c99a46727e-00-ffblkw237ocq.kirk.replit.dev"
echo "   - Android keyboard fix (input fields stay above keyboard)"
echo "   - WhatsApp-style chat interface"
echo "   - Personal Assistant companion category"
echo "   - Real AI conversations"
echo ""
echo "📥 Ready to install and test!"