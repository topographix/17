#!/bin/bash
echo "Verifying Android build configuration..."

# Check for duplicate resource definitions
echo "Checking for resource conflicts..."
find android/app/src/main/res -name "*.xml" -exec grep -l "ic_launcher_background" {} \; | while read file; do
    echo "Found ic_launcher_background reference in: $file"
    grep "ic_launcher_background" "$file"
done

# Verify proper drawable references
echo ""
echo "Verifying launcher icon references..."
grep -r "@drawable/ic_launcher_background" android/app/src/main/res/mipmap-anydpi-v26/ || echo "ERROR: Drawable references not found"
grep -r "@color/ic_launcher_background" android/app/src/main/res/mipmap-anydpi-v26/ && echo "ERROR: Color references still exist" || echo "SUCCESS: No color references found"

echo ""
echo "Android build verification complete."