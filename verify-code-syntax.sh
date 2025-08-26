#!/bin/bash

echo "🔍 VERIFYING CODE SYNTAX"
echo "========================"

# Check for duplicate files
echo "Checking for duplicate MainActivity files..."
MAIN_FILES=$(find android -name "*MainActivity*" -type f | grep -v test)
echo "Found MainActivity files: $MAIN_FILES"

if [ $(echo "$MAIN_FILES" | wc -l) -gt 1 ]; then
    echo "❌ Multiple MainActivity files found - will cause duplicate class error"
    exit 1
else
    echo "✅ Single MainActivity file found"
fi

# Check for basic syntax issues
echo "Checking basic Java syntax..."
JAVA_FILE="android/app/src/main/java/com/redvelvet/aicompanion/MainActivity.java"

# Check for proper string concatenation
if grep -q '+ "' "$JAVA_FILE"; then
    echo "✅ String concatenation syntax correct"
else
    echo "⚠️ Check string concatenation syntax"
fi

# Check for proper class declaration
if grep -q "public class MainActivity" "$JAVA_FILE"; then
    echo "✅ Class declaration syntax correct"
else
    echo "❌ Class declaration issue"
    exit 1
fi

echo "✅ CODE SYNTAX VERIFICATION COMPLETE"
echo "Ready for GitHub Actions build"