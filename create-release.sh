#!/bin/bash
# RedVelvet Release Creator
# Creates versioned zip file for download

# Increment version
node -e "
import fs from 'fs';
const versionFile = './version.json';
const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
const [major, minor, patch] = versionData.version.split('.').map(Number);
const newVersion = \`\${major}.\${minor}.\${patch + 1}\`;
versionData.version = newVersion;
versionData.lastUpdated = new Date().toISOString().split('T')[0];
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
console.log(\`Version incremented to: \${newVersion}\`);
"

# Get new version
VERSION=$(node -p "require('./version.json').version")
echo "🔄 Creating RedVelvet release v$VERSION..."

# Create temp directory for release
mkdir -p releases/temp

# Copy essential files for release
echo "📦 Packaging files..."
cp -r client releases/temp/
cp -r server releases/temp/
cp -r shared releases/temp/
cp -r android releases/temp/
cp -r data releases/temp/
cp package.json releases/temp/
cp package-lock.json releases/temp/
cp drizzle.config.ts releases/temp/
cp capacitor.config.ts releases/temp/
cp tsconfig.json releases/temp/
cp tailwind.config.ts releases/temp/
cp postcss.config.js releases/temp/
cp theme.json releases/temp/
cp README.md releases/temp/
cp replit.md releases/temp/
cp build-apk.sh releases/temp/
cp version.json releases/temp/
cp .replit releases/temp/
cp replit.nix releases/temp/

# Create release archive
cd releases
echo "🗜️ Creating tar.gz archive..."
tar --exclude="temp/node_modules" --exclude="temp/.git" --exclude="temp/dist" --exclude="temp/.cache" -czf "RedVelvet-v$VERSION.tar.gz" temp/

# Cleanup
rm -rf temp/

echo "✅ Release created: releases/RedVelvet-v$VERSION.tar.gz"
echo "📱 Version: $VERSION"
echo "📅 Date: $(date)"
echo ""
echo "Next: Run ./build-apk.sh to generate matching APK version"