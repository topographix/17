#!/bin/bash

echo "🧪 TESTING CLEAN BUILD PROCESS"
echo "==============================="

# Step 1: Clean all duplicates
echo "Step 1: Removing duplicates..."
rm -f android/app/src/main/java/com/redvelvet/aicompanion/MainActivity-simple.java
rm -f android/app/src/main/java/com/redvelvet/aicompanion/*-simple.java

# Step 2: Verify single file
echo "Step 2: Verifying single MainActivity file..."
MAIN_FILES=$(find android -name "*MainActivity*.java" | grep -v test)
echo "Found: $MAIN_FILES"
FILE_COUNT=$(echo "$MAIN_FILES" | wc -l)

if [ $FILE_COUNT -eq 1 ]; then
    echo "✅ Single MainActivity file confirmed"
else
    echo "❌ Multiple MainActivity files found"
    exit 1
fi

# Step 3: Quick syntax check
echo "Step 3: Checking syntax..."
if grep -q "public class MainActivity" android/app/src/main/java/com/redvelvet/aicompanion/MainActivity.java; then
    echo "✅ Class declaration found"
else
    echo "❌ Class declaration issue"
    exit 1
fi

echo "✅ ALL CHECKS PASSED - READY FOR BUILD"