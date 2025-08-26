#!/bin/bash

echo "🌐 BUILDING SERVER-CONNECTED NATIVE APK"
echo "========================================"

echo "🚀 NEW FEATURES:"
echo "- Interactive companion selection buttons"
echo "- Real-time server connection testing"
echo "- Dynamic status updates"
echo "- HTTP client for API calls"
echo "- Diamond counter display"
echo "- Scrollable native interface"

echo "🔗 Server Integration:"
echo "- Connects to: https://red-velvet-connection.replit.app"
echo "- Tests /api/guest/session endpoint"
echo "- Real-time connection status updates"
echo "- Companion selection with server communication"

cd android
./gradlew clean
./gradlew assembleDebug --info

if [ $? -eq 0 ]; then
    echo "✅ SERVER-CONNECTED APK BUILD SUCCESS!"
    echo "📱 APK: android/app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
    
    echo ""
    echo "📋 Expected Behavior:"
    echo "1. Shows 'Connecting to server...' initially"
    echo "2. Tests server connection automatically"
    echo "3. Updates to 'Server connected! Ready for companions' or 'Server connection failed'"
    echo "4. Clickable companion buttons (Sophia, Emma, Isabella, James)"
    echo "5. Selection confirmation when companion is chosen"
    echo "6. Diamond counter: '25 Diamonds Available'"
    
    echo ""
    echo "🔄 Next Phase:"
    echo "- Add real companion data fetching from server"
    echo "- Implement chat interface"
    echo "- Add diamond system integration"
    echo "- Full RedVelvet functionality"
else
    echo "❌ BUILD FAILED"
    exit 1
fi