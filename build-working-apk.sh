#!/bin/bash

echo "🔧 BUILDING WORKING CHAT APK"
echo "============================="

echo "🛠️  CRITICAL FIXES APPLIED:"
echo "- Fixed chat API endpoint authentication"
echo "- Added proper session ID handling"
echo "- Fixed system bar visibility in chat"
echo "- Enhanced error handling and logging"

echo "📱 ANDROID SYSTEM BAR FIXES:"
echo "- Chat interface: Added padding for status bar and navigation"
echo "- Proper spacing maintained throughout chat session"
echo "- System bars visible from chat start"

echo "🌐 API AUTHENTICATION FIXES:"
echo "- Added X-Session-ID header for mobile routes"
echo "- Proper session management between save and response"
echo "- Fixed JSON payload structure for both endpoints"

cd android
./gradlew clean
./gradlew assembleDebug --info

if [ $? -eq 0 ]; then
    echo "✅ WORKING CHAT APK BUILD SUCCESS!"
    echo "📱 APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    
    echo ""
    echo "🎯 EXPECTED FIXES:"
    echo "1. Chat messages will send successfully"
    echo "2. AI responses will be received"
    echo "3. Diamond count will decrease properly"
    echo "4. System bars visible from chat start"
    echo "5. Proper authentication with server"
else
    echo "❌ BUILD FAILED"
    exit 1
fi