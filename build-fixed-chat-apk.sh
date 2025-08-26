#!/bin/bash

echo "🛠️  BUILDING FIXED CHAT APK"
echo "============================"

echo "🔧 FIXES APPLIED:"
echo "- Added proper Android padding for status bar and navigation"
echo "- Fixed chat API endpoints to match server routes"
echo "- Improved error handling with typing indicator cleanup"
echo "- Separated chat save and AI response calls"
echo "- Enhanced logging for debugging"

echo "📱 ANDROID LAYOUT FIXES:"
echo "- Home page: Added padding for status bar (top) and navigation (bottom)"
echo "- Chat interface: Proper spacing for Android UI elements"
echo "- Message bubbles: Improved positioning"

echo "🌐 SERVER API FIXES:"
echo "- Chat save: Uses /api/mobile/chat/save"
echo "- AI response: Uses /api/chat"
echo "- Proper JSON field names (messageContent vs message)"
echo "- Better error handling and user feedback"

cd android
./gradlew clean
./gradlew assembleDebug --info

if [ $? -eq 0 ]; then
    echo "✅ FIXED CHAT APK BUILD SUCCESS!"
    echo "📱 APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    
    echo ""
    echo "🎯 EXPECTED IMPROVEMENTS:"
    echo "1. Home page properly spaced for Android status bar"
    echo "2. Chat messages save and AI responds correctly"
    echo "3. Diamond count decreases with each message"
    echo "4. Better error messages and typing indicator cleanup"
    echo "5. Improved mobile layout and spacing"
else
    echo "❌ BUILD FAILED"
    exit 1
fi