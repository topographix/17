#!/bin/bash
# Add changelog entry for current version

if [ $# -eq 0 ]; then
    echo "Usage: ./add-changelog.sh \"Change description\""
    exit 1
fi

CHANGE="$1"
VERSION=$(node -p "require('./version.json').version")

echo "📝 Adding changelog entry for v$VERSION: $CHANGE"

node -e "
const fs = require('fs');
const versionFile = './version.json';
const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

// Add change to current version's changelog
const currentVersionEntry = versionData.changelog.find(entry => entry.version === '$VERSION');
if (currentVersionEntry) {
    currentVersionEntry.changes.push('$CHANGE');
} else {
    versionData.changelog.unshift({
        version: '$VERSION',
        date: new Date().toISOString().split('T')[0],
        changes: ['$CHANGE']
    });
}

fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
console.log('✅ Changelog updated');
"