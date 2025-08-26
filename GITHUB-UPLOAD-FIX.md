# Complete Java Fix - All 3 Files Found

## All Files That Need Java 17 (Not Java 21)

### File 1: android/app/build.gradle
**Lines 27-28:**
```gradle
sourceCompatibility JavaVersion.VERSION_17
targetCompatibility JavaVersion.VERSION_17
```

### File 2: android/capacitor-cordova-android-plugins/build.gradle  
**Lines 31-32:**
```gradle
sourceCompatibility JavaVersion.VERSION_17
targetCompatibility JavaVersion.VERSION_17
```

### File 3: android/app/capacitor.build.gradle
**Lines 5-6:**
```gradle
sourceCompatibility JavaVersion.VERSION_17
targetCompatibility JavaVersion.VERSION_17
```

## Quick Fix Options

**Option A: Download Complete Fixed Code**
1. Download all files from this Replit (I've fixed all 3 files)
2. Replace your entire project folder
3. Commit and push

**Option B: Manual Edit All 3 Files**
1. Edit all 3 files above, changing VERSION_21 to VERSION_17
2. Save all files
3. Commit and push

**Option C: Use Search and Replace**
1. In your project folder, search for "VERSION_21"
2. Replace all instances with "VERSION_17"
3. Should find and fix all 3 files at once

After fixing all 3 files, your build will succeed.