# GitHub Actions APK Build Setup

## Quick Setup Steps

### 1. Create GitHub Repository
1. Go to https://github.com and create a new repository
2. Name it "redvelvet-app" (or your preferred name)
3. Make it public or private (both work with Actions)

### 2. Initialize Git and Push Code
Run these commands in your terminal:

```bash
git init
git add .
git commit -m "Initial RedVelvet app setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/redvelvet-app.git
git push -u origin main
```

### 3. Enable GitHub Actions
- Go to your repository on GitHub
- Click "Actions" tab
- GitHub will automatically detect the workflow file
- Click "Enable Actions" if prompted

### 4. Monitor Build Progress
- After pushing, go to "Actions" tab
- You'll see "Build Android APK" workflow running
- Build takes about 5-10 minutes
- APK will be available for download when complete

### 5. Download Your APK
Two ways to get your APK:

**Option A: From Actions Tab**
- Click on completed workflow run
- Scroll to "Artifacts" section
- Download "redvelvet-debug-apk"

**Option B: From Releases**
- Go to "Releases" section of your repo
- Download APK from latest release

## What Happens During Build
1. GitHub Actions sets up Ubuntu environment
2. Installs Node.js 20 and Java 21
3. Builds your web assets
4. Syncs Capacitor Android project
5. Compiles APK using Gradle
6. Uploads APK as downloadable artifact

## Files Already Configured
- `.github/workflows/android-build.yml` - Build configuration
- `android/` directory - Android project files
- `capacitor.config.ts` - App configuration

Your APK will be ready in about 10 minutes after pushing to GitHub!