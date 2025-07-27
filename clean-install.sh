#!/bin/bash

echo "🧹 Cleaning up for Expo SDK 52..."

# Remove node_modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Clear expo cache
npx expo install --fix

# Clear metro cache
npx expo start --clear

echo "✅ Cleanup complete! Run 'npm install' or 'yarn install' to reinstall dependencies." 