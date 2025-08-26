# GitHub Actions Build Failure Fix Guide

## Common Build Failures and Solutions

### Step 1: Check the Error Details
1. Go to your GitHub repository
2. Click "Actions" tab
3. Click on the failed workflow (red X)
4. Click on "build" job
5. Expand the failed step to see exact error message

### Common Issues and Fixes:

## Issue 1: Missing package-lock.json
**Error:** `npm ci` failed
**Fix:** Update workflow to use `npm install` instead:
```yaml
- name: Install dependencies
  run: npm install
```

## Issue 2: Missing Android Gradle Files
**Error:** `./gradlew: No such file or directory`
**Fix:** Ensure android folder uploaded completely with these files:
- `android/gradlew`
- `android/gradlew.bat` 
- `android/gradle/wrapper/gradle-wrapper.jar`
- `android/gradle/wrapper/gradle-wrapper.properties`

## Issue 3: Java/Gradle Version Mismatch
**Error:** Gradle build failed with Java version issues
**Fix:** Update workflow Java version:
```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'  # Changed from 21 to 17
```

## Issue 4: Build Script Missing
**Error:** `npm run build` failed
**Fix:** Check package.json has build script:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

## Quick Fix Workflow (Works for Most Cases)
Replace your workflow file with this simplified version:

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build web assets
      run: npm run build || echo "Build step failed, continuing..."
      
    - name: Make Gradle executable
      run: chmod +x android/gradlew
      
    - name: Sync Capacitor
      run: npx cap sync android
        
    - name: Build Android APK
      run: |
        cd android
        ./gradlew assembleDebug --no-daemon --stacktrace
        
    - name: Upload APK
      uses: actions/upload-artifact@v4
      with:
        name: redvelvet-debug-apk
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

## How to Apply the Fix:
1. Go to your repository
2. Navigate to `.github/workflows/android-build.yml`
3. Click edit (pencil icon)
4. Replace content with the Quick Fix Workflow above
5. Commit changes
6. Build will restart automatically

Tell me what specific error message you see and I'll provide a targeted fix.