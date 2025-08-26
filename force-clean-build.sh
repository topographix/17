#!/bin/bash

echo "🔥 FORCE CLEAN BUILD - ELIMINATE ALL DUPLICATES"
echo "=============================================="

# Remove any duplicate files locally
echo "Removing duplicate MainActivity files..."
find . -name "*MainActivity-simple*" -type f -delete
find . -name "*MainActivity*.java" -type f

# Clean Android build
echo "Cleaning Android build cache..."
cd android
./gradlew clean --quiet

# List MainActivity files to confirm single file
echo "Confirming single MainActivity file:"
find . -name "*MainActivity*" -type f

echo "✅ FORCE CLEAN COMPLETE"
echo "Ready for build"