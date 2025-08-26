# RedVelvet Android APK Build Guide

## Prerequisites

1. **Install Android Studio** (includes Android SDK and Java)
   - Download from: https://developer.android.com/studio
   - Follow installation wizard

2. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/

## Build Steps

### 1. Prepare Your Environment

```bash
# Install dependencies
npm install

# Build the web application
npm run build

# Sync with Capacitor
npx cap sync android
```

### 2. Open in Android Studio

```bash
# Open the Android project
npx cap open android
```

This will open Android Studio with your project.

### 3. Build APK in Android Studio

1. In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for the build to complete
3. The APK will be generated in: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Alternative: Command Line Build

If you prefer command line:

```bash
cd android
./gradlew assembleDebug
```

The APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Configuration Files

The following files have been configured for your RedVelvet app:

- `capacitor.config.ts` - Main Capacitor configuration
- `android/app/src/main/AndroidManifest.xml` - Android app manifest
- `android/app/src/main/res/values/strings.xml` - App name and strings

## App Details

- **App Name**: RedVelvet
- **Package ID**: com.redvelvet.aicompanion
- **Theme Color**: #E91E63 (Pink)
- **Target SDK**: Latest Android versions

## Signing for Release

For production release:

1. Generate a signing key:
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. Configure signing in `android/app/build.gradle`
3. Build release APK: `./gradlew assembleRelease`

## Testing

- Install on device: `adb install app-debug.apk`
- Or use Android Studio's device manager

## Troubleshooting

- **Build fails**: Ensure Android SDK is properly installed
- **App crashes**: Check Android logs with `adb logcat`
- **Network issues**: Verify server endpoints in the app

Your RedVelvet AI companion app is now ready for Android deployment!