@echo off
echo 🧹 Cleaning up for Expo SDK 52...

REM Remove node_modules and lock files
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

REM Clear expo cache
npx expo install --fix

REM Clear metro cache
npx expo start --clear

echo ✅ Cleanup complete! Run 'npm install' or 'yarn install' to reinstall dependencies.
pause 