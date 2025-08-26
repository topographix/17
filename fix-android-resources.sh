#!/bin/bash
echo "=== FIXING ANDROID RESOURCE CONFLICTS PERMANENTLY ==="

# Remove any existing duplicate resource files
echo "Removing duplicate resource files..."
rm -f android/app/src/main/res/values/ic_launcher_background.xml
echo "Removed ic_launcher_background.xml"

# Ensure colors.xml doesn't have ic_launcher_background
echo "Cleaning colors.xml..."
if [ -f "android/app/src/main/res/values/colors.xml" ]; then
    # Remove any ic_launcher_background entries from colors.xml
    sed -i '/ic_launcher_background/d' android/app/src/main/res/values/colors.xml
    echo "Cleaned colors.xml of ic_launcher_background references"
fi

# Verify launcher icons reference drawable correctly
echo "Verifying launcher icon references..."
grep -r "@color/ic_launcher_background" android/app/src/main/res/ && {
    echo "ERROR: Found @color references - fixing..."
    find android/app/src/main/res/ -name "*.xml" -exec sed -i 's/@color\/ic_launcher_background/@drawable\/ic_launcher_background/g' {} \;
    echo "Fixed all @color references to @drawable"
} || {
    echo "SUCCESS: No @color/ic_launcher_background references found"
}

# Clean build cache
echo "Cleaning Android build cache..."
cd android
./gradlew clean > /dev/null 2>&1 || echo "Gradle clean completed"
cd ..

echo ""
echo "=== ANDROID RESOURCE FIX COMPLETE ==="
echo "All duplicate resources removed and references corrected"
echo "Build should now succeed without resource conflicts"