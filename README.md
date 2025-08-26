# RedVelvet - AI Companion Platform

A cross-platform AI companion app with WhatsApp-style chat interface.

## Features

- **AI Companions**: Personalized AI chat with varied responses
- **Diamond System**: Virtual currency for messaging
- **Android APK**: Native mobile app with device tracking
- **Real-time Chat**: WhatsApp-style messaging interface
- **Device Security**: Anti-abuse diamond tracking per device

## Quick Start

### Web App
```bash
npm run dev
```
Access at: http://localhost:5000

### Android APK
```bash
./build-apk.sh
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Project Structure

- `client/` - React frontend
- `server/` - Express backend with AI integration
- `android/` - Capacitor Android project
- `shared/` - Database schema and types

## Development Status

All critical issues resolved and tested:
- ✅ AI bot responds correctly with diamond deduction
- ✅ Back button navigation fixed for Android
- ✅ Device-based diamond tracking system
- ✅ Production-ready APK build